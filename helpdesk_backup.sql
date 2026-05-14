--
-- PostgreSQL database dump
--

\restrict UafFi21SCG9jrQWSYx83fCq2gL2nO3JxEAuxwV5fVj58Oa69efseJ4kGJUKButt

-- Dumped from database version 16.13
-- Dumped by pg_dump version 16.13

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: alembic_version; Type: TABLE; Schema: public; Owner: helpdesk
--

CREATE TABLE public.alembic_version (
    version_num character varying(32) NOT NULL
);


ALTER TABLE public.alembic_version OWNER TO helpdesk;

--
-- Name: api_keys; Type: TABLE; Schema: public; Owner: helpdesk
--

CREATE TABLE public.api_keys (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    client_id character varying(100) NOT NULL,
    hashed_key character varying(255) NOT NULL,
    company_id integer NOT NULL,
    is_active boolean DEFAULT true,
    last_used timestamp with time zone,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.api_keys OWNER TO helpdesk;

--
-- Name: api_keys_id_seq; Type: SEQUENCE; Schema: public; Owner: helpdesk
--

CREATE SEQUENCE public.api_keys_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.api_keys_id_seq OWNER TO helpdesk;

--
-- Name: api_keys_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: helpdesk
--

ALTER SEQUENCE public.api_keys_id_seq OWNED BY public.api_keys.id;


--
-- Name: assignments; Type: TABLE; Schema: public; Owner: helpdesk
--

CREATE TABLE public.assignments (
    id integer NOT NULL,
    product_id integer,
    user_id integer,
    company_id integer,
    condition_on_delivery character varying(100),
    notes text,
    act_code character varying(50),
    digital_signature_url character varying(500),
    stamp_hash character varying(64),
    is_active boolean,
    assigned_at timestamp without time zone,
    returned_at timestamp without time zone
);


ALTER TABLE public.assignments OWNER TO helpdesk;

--
-- Name: assignments_id_seq; Type: SEQUENCE; Schema: public; Owner: helpdesk
--

CREATE SEQUENCE public.assignments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.assignments_id_seq OWNER TO helpdesk;

--
-- Name: assignments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: helpdesk
--

ALTER SEQUENCE public.assignments_id_seq OWNED BY public.assignments.id;


--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: helpdesk
--

CREATE TABLE public.audit_logs (
    id integer NOT NULL,
    user_id integer,
    action character varying(100) NOT NULL,
    entity_name character varying(50),
    entity_id integer,
    details json,
    ip_address character varying(45),
    "timestamp" timestamp with time zone DEFAULT now()
);


ALTER TABLE public.audit_logs OWNER TO helpdesk;

--
-- Name: audit_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: helpdesk
--

CREATE SEQUENCE public.audit_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.audit_logs_id_seq OWNER TO helpdesk;

--
-- Name: audit_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: helpdesk
--

ALTER SEQUENCE public.audit_logs_id_seq OWNED BY public.audit_logs.id;


--
-- Name: calendar_events; Type: TABLE; Schema: public; Owner: helpdesk
--

CREATE TABLE public.calendar_events (
    id integer NOT NULL,
    title character varying(200) NOT NULL,
    description text,
    start_time timestamp without time zone NOT NULL,
    end_time timestamp without time zone,
    type character varying(50),
    priority character varying(20),
    company_id integer,
    user_id integer,
    department_id integer,
    maintenance_id integer,
    ticket_id integer,
    is_public boolean,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone
);


ALTER TABLE public.calendar_events OWNER TO helpdesk;

--
-- Name: calendar_events_id_seq; Type: SEQUENCE; Schema: public; Owner: helpdesk
--

CREATE SEQUENCE public.calendar_events_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.calendar_events_id_seq OWNER TO helpdesk;

--
-- Name: calendar_events_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: helpdesk
--

ALTER SEQUENCE public.calendar_events_id_seq OWNED BY public.calendar_events.id;


--
-- Name: categories; Type: TABLE; Schema: public; Owner: helpdesk
--

CREATE TABLE public.categories (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    department_id integer,
    company_id integer
);


ALTER TABLE public.categories OWNER TO helpdesk;

--
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: helpdesk
--

CREATE SEQUENCE public.categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.categories_id_seq OWNER TO helpdesk;

--
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: helpdesk
--

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;


--
-- Name: chat_messages; Type: TABLE; Schema: public; Owner: helpdesk
--

CREATE TABLE public.chat_messages (
    id integer NOT NULL,
    ticket_id integer,
    user_id integer,
    message text NOT NULL,
    is_internal boolean,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.chat_messages OWNER TO helpdesk;

--
-- Name: chat_messages_id_seq; Type: SEQUENCE; Schema: public; Owner: helpdesk
--

CREATE SEQUENCE public.chat_messages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.chat_messages_id_seq OWNER TO helpdesk;

--
-- Name: chat_messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: helpdesk
--

ALTER SEQUENCE public.chat_messages_id_seq OWNED BY public.chat_messages.id;


--
-- Name: companies; Type: TABLE; Schema: public; Owner: helpdesk
--

CREATE TABLE public.companies (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    tax_id character varying(50),
    is_active boolean,
    created_at timestamp with time zone DEFAULT now(),
    logo_url character varying(500),
    address character varying(500),
    phone character varying(50)
);


ALTER TABLE public.companies OWNER TO helpdesk;

--
-- Name: companies_id_seq; Type: SEQUENCE; Schema: public; Owner: helpdesk
--

CREATE SEQUENCE public.companies_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.companies_id_seq OWNER TO helpdesk;

--
-- Name: companies_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: helpdesk
--

ALTER SEQUENCE public.companies_id_seq OWNED BY public.companies.id;


--
-- Name: departments; Type: TABLE; Schema: public; Owner: helpdesk
--

CREATE TABLE public.departments (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    company_id integer
);


ALTER TABLE public.departments OWNER TO helpdesk;

--
-- Name: departments_id_seq; Type: SEQUENCE; Schema: public; Owner: helpdesk
--

CREATE SEQUENCE public.departments_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.departments_id_seq OWNER TO helpdesk;

--
-- Name: departments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: helpdesk
--

ALTER SEQUENCE public.departments_id_seq OWNED BY public.departments.id;


--
-- Name: external_apps; Type: TABLE; Schema: public; Owner: helpdesk
--

CREATE TABLE public.external_apps (
    id integer NOT NULL,
    name character varying NOT NULL,
    client_id character varying NOT NULL,
    api_key_hash character varying NOT NULL,
    prefix character varying,
    is_active boolean,
    company_id integer NOT NULL,
    created_at timestamp without time zone
);


ALTER TABLE public.external_apps OWNER TO helpdesk;

--
-- Name: external_apps_id_seq; Type: SEQUENCE; Schema: public; Owner: helpdesk
--

CREATE SEQUENCE public.external_apps_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.external_apps_id_seq OWNER TO helpdesk;

--
-- Name: external_apps_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: helpdesk
--

ALTER SEQUENCE public.external_apps_id_seq OWNED BY public.external_apps.id;


--
-- Name: inventory_movements; Type: TABLE; Schema: public; Owner: helpdesk
--

CREATE TABLE public.inventory_movements (
    id integer NOT NULL,
    code character varying(50),
    product_id integer,
    ticket_id integer,
    user_id integer,
    quantity double precision NOT NULL,
    reason character varying(255),
    warehouse_id integer,
    type character varying(20) NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.inventory_movements OWNER TO helpdesk;

--
-- Name: inventory_movements_id_seq; Type: SEQUENCE; Schema: public; Owner: helpdesk
--

CREATE SEQUENCE public.inventory_movements_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.inventory_movements_id_seq OWNER TO helpdesk;

--
-- Name: inventory_movements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: helpdesk
--

ALTER SEQUENCE public.inventory_movements_id_seq OWNED BY public.inventory_movements.id;


--
-- Name: maintenances; Type: TABLE; Schema: public; Owner: helpdesk
--

CREATE TABLE public.maintenances (
    id integer NOT NULL,
    product_id integer,
    tecnico_id integer,
    ticket_id integer,
    type character varying(50),
    priority character varying(50),
    description text,
    scheduled_date timestamp without time zone NOT NULL,
    completed_at timestamp without time zone,
    status character varying(50),
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.maintenances OWNER TO helpdesk;

--
-- Name: maintenances_id_seq; Type: SEQUENCE; Schema: public; Owner: helpdesk
--

CREATE SEQUENCE public.maintenances_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.maintenances_id_seq OWNER TO helpdesk;

--
-- Name: maintenances_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: helpdesk
--

ALTER SEQUENCE public.maintenances_id_seq OWNED BY public.maintenances.id;


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: helpdesk
--

CREATE TABLE public.notifications (
    id integer NOT NULL,
    user_id integer,
    title character varying(200) NOT NULL,
    message text NOT NULL,
    type character varying(50),
    url character varying(255),
    is_read boolean,
    email_sent boolean,
    created_at timestamp without time zone
);


ALTER TABLE public.notifications OWNER TO helpdesk;

--
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: helpdesk
--

CREATE SEQUENCE public.notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notifications_id_seq OWNER TO helpdesk;

--
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: helpdesk
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- Name: products; Type: TABLE; Schema: public; Owner: helpdesk
--

CREATE TABLE public.products (
    id integer NOT NULL,
    code character varying(50),
    name character varying(200) NOT NULL,
    description text,
    price double precision,
    stock double precision,
    created_at timestamp with time zone DEFAULT now(),
    barcode character varying(100),
    type character varying(50),
    stock_minimo double precision,
    cost double precision,
    company_id integer,
    category_id integer,
    provider_id integer,
    serial_number character varying(100),
    purchase_date timestamp without time zone,
    warranty_template_id character varying(100),
    specs json,
    updated_at timestamp with time zone
);


ALTER TABLE public.products OWNER TO helpdesk;

--
-- Name: products_id_seq; Type: SEQUENCE; Schema: public; Owner: helpdesk
--

CREATE SEQUENCE public.products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.products_id_seq OWNER TO helpdesk;

--
-- Name: products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: helpdesk
--

ALTER SEQUENCE public.products_id_seq OWNED BY public.products.id;


--
-- Name: providers; Type: TABLE; Schema: public; Owner: helpdesk
--

CREATE TABLE public.providers (
    id integer NOT NULL,
    name character varying(200) NOT NULL,
    tax_id character varying(50),
    contact_name character varying(100),
    email character varying(100),
    phone character varying(50),
    company_id integer
);


ALTER TABLE public.providers OWNER TO helpdesk;

--
-- Name: providers_id_seq; Type: SEQUENCE; Schema: public; Owner: helpdesk
--

CREATE SEQUENCE public.providers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.providers_id_seq OWNER TO helpdesk;

--
-- Name: providers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: helpdesk
--

ALTER SEQUENCE public.providers_id_seq OWNED BY public.providers.id;


--
-- Name: purchase_order_items; Type: TABLE; Schema: public; Owner: helpdesk
--

CREATE TABLE public.purchase_order_items (
    id integer NOT NULL,
    order_id integer,
    product_id integer,
    quantity double precision NOT NULL,
    cost double precision NOT NULL
);


ALTER TABLE public.purchase_order_items OWNER TO helpdesk;

--
-- Name: purchase_order_items_id_seq; Type: SEQUENCE; Schema: public; Owner: helpdesk
--

CREATE SEQUENCE public.purchase_order_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.purchase_order_items_id_seq OWNER TO helpdesk;

--
-- Name: purchase_order_items_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: helpdesk
--

ALTER SEQUENCE public.purchase_order_items_id_seq OWNED BY public.purchase_order_items.id;


--
-- Name: purchase_orders; Type: TABLE; Schema: public; Owner: helpdesk
--

CREATE TABLE public.purchase_orders (
    id integer NOT NULL,
    code character varying(50),
    provider_id integer,
    total double precision,
    status character varying(50),
    company_id integer,
    created_at timestamp with time zone DEFAULT now()
);


ALTER TABLE public.purchase_orders OWNER TO helpdesk;

--
-- Name: purchase_orders_id_seq; Type: SEQUENCE; Schema: public; Owner: helpdesk
--

CREATE SEQUENCE public.purchase_orders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.purchase_orders_id_seq OWNER TO helpdesk;

--
-- Name: purchase_orders_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: helpdesk
--

ALTER SEQUENCE public.purchase_orders_id_seq OWNED BY public.purchase_orders.id;


--
-- Name: roles; Type: TABLE; Schema: public; Owner: helpdesk
--

CREATE TABLE public.roles (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    description character varying(255),
    permissions jsonb DEFAULT '{}'::jsonb,
    is_system boolean DEFAULT false,
    company_id integer,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.roles OWNER TO helpdesk;

--
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: helpdesk
--

CREATE SEQUENCE public.roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.roles_id_seq OWNER TO helpdesk;

--
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: helpdesk
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- Name: sequences; Type: TABLE; Schema: public; Owner: helpdesk
--

CREATE TABLE public.sequences (
    entity character varying(50) NOT NULL,
    last_number integer
);


ALTER TABLE public.sequences OWNER TO helpdesk;

--
-- Name: support_rounds; Type: TABLE; Schema: public; Owner: helpdesk
--

CREATE TABLE public.support_rounds (
    id integer NOT NULL,
    company_id integer,
    area character varying(200) NOT NULL,
    responsible_name character varying(200) NOT NULL,
    technician_name character varying(200) NOT NULL,
    has_incident boolean DEFAULT false,
    incident_description text,
    action_taken text,
    visit_time timestamp without time zone NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.support_rounds OWNER TO helpdesk;

--
-- Name: support_rounds_id_seq; Type: SEQUENCE; Schema: public; Owner: helpdesk
--

CREATE SEQUENCE public.support_rounds_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.support_rounds_id_seq OWNER TO helpdesk;

--
-- Name: support_rounds_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: helpdesk
--

ALTER SEQUENCE public.support_rounds_id_seq OWNED BY public.support_rounds.id;


--
-- Name: tickets; Type: TABLE; Schema: public; Owner: helpdesk
--

CREATE TABLE public.tickets (
    id integer NOT NULL,
    code character varying(50),
    title character varying(255) NOT NULL,
    description text NOT NULL,
    status character varying(50),
    priority character varying(50),
    company_id integer,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone,
    department_id integer,
    category_id integer,
    requester_id integer,
    requester_name character varying(255),
    requester_dept character varying(255),
    technician_id integer,
    asset_id integer,
    photo_before character varying(500),
    photo_after character varying(500),
    closing_signature character varying(500),
    lat double precision,
    lng double precision,
    maps_url character varying(500),
    external_source character varying(100)
);


ALTER TABLE public.tickets OWNER TO helpdesk;

--
-- Name: tickets_id_seq; Type: SEQUENCE; Schema: public; Owner: helpdesk
--

CREATE SEQUENCE public.tickets_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tickets_id_seq OWNER TO helpdesk;

--
-- Name: tickets_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: helpdesk
--

ALTER SEQUENCE public.tickets_id_seq OWNED BY public.tickets.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: helpdesk
--

CREATE TABLE public.users (
    id integer NOT NULL,
    email character varying(255) NOT NULL,
    hashed_password character varying(255) NOT NULL,
    full_name character varying(255),
    role character varying(50),
    is_active boolean,
    company_id integer,
    created_at timestamp with time zone DEFAULT now(),
    department_id integer,
    signature_url character varying(500),
    user_code character varying(50),
    role_id integer,
    role_name character varying(50),
    username character varying(100)
);


ALTER TABLE public.users OWNER TO helpdesk;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: helpdesk
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO helpdesk;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: helpdesk
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: warehouses; Type: TABLE; Schema: public; Owner: helpdesk
--

CREATE TABLE public.warehouses (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    location character varying(200),
    company_id integer
);


ALTER TABLE public.warehouses OWNER TO helpdesk;

--
-- Name: warehouses_id_seq; Type: SEQUENCE; Schema: public; Owner: helpdesk
--

CREATE SEQUENCE public.warehouses_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.warehouses_id_seq OWNER TO helpdesk;

--
-- Name: warehouses_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: helpdesk
--

ALTER SEQUENCE public.warehouses_id_seq OWNED BY public.warehouses.id;


--
-- Name: warranty_templates; Type: TABLE; Schema: public; Owner: helpdesk
--

CREATE TABLE public.warranty_templates (
    id integer NOT NULL,
    company_id integer,
    name character varying(100) NOT NULL,
    months integer,
    terms text,
    return_policy text,
    created_at timestamp without time zone
);


ALTER TABLE public.warranty_templates OWNER TO helpdesk;

--
-- Name: warranty_templates_id_seq; Type: SEQUENCE; Schema: public; Owner: helpdesk
--

CREATE SEQUENCE public.warranty_templates_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.warranty_templates_id_seq OWNER TO helpdesk;

--
-- Name: warranty_templates_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: helpdesk
--

ALTER SEQUENCE public.warranty_templates_id_seq OWNED BY public.warranty_templates.id;


--
-- Name: webhook_logs; Type: TABLE; Schema: public; Owner: helpdesk
--

CREATE TABLE public.webhook_logs (
    id integer NOT NULL,
    external_app_id integer,
    event character varying(50),
    url character varying(500),
    payload json,
    response_status integer,
    response_body text,
    retry_count integer,
    created_at timestamp without time zone
);


ALTER TABLE public.webhook_logs OWNER TO helpdesk;

--
-- Name: webhook_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: helpdesk
--

CREATE SEQUENCE public.webhook_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.webhook_logs_id_seq OWNER TO helpdesk;

--
-- Name: webhook_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: helpdesk
--

ALTER SEQUENCE public.webhook_logs_id_seq OWNED BY public.webhook_logs.id;


--
-- Name: api_keys id; Type: DEFAULT; Schema: public; Owner: helpdesk
--

ALTER TABLE ONLY public.api_keys ALTER COLUMN id SET DEFAULT nextval('public.api_keys_id_seq'::regclass);


--
-- Name: assignments id; Type: DEFAULT; Schema: public; Owner: helpdesk
--

ALTER TABLE ONLY public.assignments ALTER COLUMN id SET DEFAULT nextval('public.assignments_id_seq'::regclass);


--
-- Name: audit_logs id; Type: DEFAULT; Schema: public; Owner: helpdesk
--

ALTER TABLE ONLY public.audit_logs ALTER COLUMN id SET DEFAULT nextval('public.audit_logs_id_seq'::regclass);


--
-- Name: calendar_events id; Type: DEFAULT; Schema: public; Owner: helpdesk
--

ALTER TABLE ONLY public.calendar_events ALTER COLUMN id SET DEFAULT nextval('public.calendar_events_id_seq'::regclass);


--
-- Name: categories id; Type: DEFAULT; Schema: public; Owner: helpdesk
--

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- Name: chat_messages id; Type: DEFAULT; Schema: public; Owner: helpdesk
--

ALTER TABLE ONLY public.chat_messages ALTER COLUMN id SET DEFAULT nextval('public.chat_messages_id_seq'::regclass);


--
-- Name: companies id; Type: DEFAULT; Schema: public; Owner: helpdesk
--

ALTER TABLE ONLY public.companies ALTER COLUMN id SET DEFAULT nextval('public.companies_id_seq'::regclass);


--
-- Name: departments id; Type: DEFAULT; Schema: public; Owner: helpdesk
--

ALTER TABLE ONLY public.departments ALTER COLUMN id SET DEFAULT nextval('public.departments_id_seq'::regclass);


--
-- Name: external_apps id; Type: DEFAULT; Schema: public; Owner: helpdesk
--

ALTER TABLE ONLY public.external_apps ALTER COLUMN id SET DEFAULT nextval('public.external_apps_id_seq'::regclass);


--
-- Name: inventory_movements id; Type: DEFAULT; Schema: public; Owner: helpdesk
--

ALTER TABLE ONLY public.inventory_movements ALTER COLUMN id SET DEFAULT nextval('public.inventory_movements_id_seq'::regclass);


--
-- Name: maintenances id; Type: DEFAULT; Schema: public; Owner: helpdesk
--

ALTER TABLE ONLY public.maintenances ALTER COLUMN id SET DEFAULT nextval('public.maintenances_id_seq'::regclass);


--
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: helpdesk
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- Name: products id; Type: DEFAULT; Schema: public; Owner: helpdesk
--

ALTER TABLE ONLY public.products ALTER COLUMN id SET DEFAULT nextval('public.products_id_seq'::regclass);


--
-- Name: providers id; Type: DEFAULT; Schema: public; Owner: helpdesk
--

ALTER TABLE ONLY public.providers ALTER COLUMN id SET DEFAULT nextval('public.providers_id_seq'::regclass);


--
-- Name: purchase_order_items id; Type: DEFAULT; Schema: public; Owner: helpdesk
--

ALTER TABLE ONLY public.purchase_order_items ALTER COLUMN id SET DEFAULT nextval('public.purchase_order_items_id_seq'::regclass);


--
-- Name: purchase_orders id; Type: DEFAULT; Schema: public; Owner: helpdesk
--

ALTER TABLE ONLY public.purchase_orders ALTER COLUMN id SET DEFAULT nextval('public.purchase_orders_id_seq'::regclass);


--
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: helpdesk
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- Name: support_rounds id; Type: DEFAULT; Schema: public; Owner: helpdesk
--

ALTER TABLE ONLY public.support_rounds ALTER COLUMN id SET DEFAULT nextval('public.support_rounds_id_seq'::regclass);


--
-- Name: tickets id; Type: DEFAULT; Schema: public; Owner: helpdesk
--

ALTER TABLE ONLY public.tickets ALTER COLUMN id SET DEFAULT nextval('public.tickets_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: helpdesk
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: warehouses id; Type: DEFAULT; Schema: public; Owner: helpdesk
--

ALTER TABLE ONLY public.warehouses ALTER COLUMN id SET DEFAULT nextval('public.warehouses_id_seq'::regclass);


--
-- Name: warranty_templates id; Type: DEFAULT; Schema: public; Owner: helpdesk
--

ALTER TABLE ONLY public.warranty_templates ALTER COLUMN id SET DEFAULT nextval('public.warranty_templates_id_seq'::regclass);


--
-- Name: webhook_logs id; Type: DEFAULT; Schema: public; Owner: helpdesk
--

ALTER TABLE ONLY public.webhook_logs ALTER COLUMN id SET DEFAULT nextval('public.webhook_logs_id_seq'::regclass);


--
-- Data for Name: alembic_version; Type: TABLE DATA; Schema: public; Owner: helpdesk
--

COPY public.alembic_version (version_num) FROM stdin;
495c0c76ccc9
\.


--
-- Data for Name: api_keys; Type: TABLE DATA; Schema: public; Owner: helpdesk
--

COPY public.api_keys (id, name, client_id, hashed_key, company_id, is_active, last_used, created_at) FROM stdin;
\.


--
-- Data for Name: assignments; Type: TABLE DATA; Schema: public; Owner: helpdesk
--

COPY public.assignments (id, product_id, user_id, company_id, condition_on_delivery, notes, act_code, digital_signature_url, stamp_hash, is_active, assigned_at, returned_at) FROM stdin;
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: helpdesk
--

COPY public.audit_logs (id, user_id, action, entity_name, entity_id, details, ip_address, "timestamp") FROM stdin;
\.


--
-- Data for Name: calendar_events; Type: TABLE DATA; Schema: public; Owner: helpdesk
--

COPY public.calendar_events (id, title, description, start_time, end_time, type, priority, company_id, user_id, department_id, maintenance_id, ticket_id, is_public, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: helpdesk
--

COPY public.categories (id, name, department_id, company_id) FROM stdin;
1	Hardware	1	1
2	Software	1	1
3	Redes	1	1
4	Plomería	2	1
5	Electricidad	2	1
6	Impresora / Impresion	1	1
\.


--
-- Data for Name: chat_messages; Type: TABLE DATA; Schema: public; Owner: helpdesk
--

COPY public.chat_messages (id, ticket_id, user_id, message, is_internal, created_at) FROM stdin;
\.


--
-- Data for Name: companies; Type: TABLE DATA; Schema: public; Owner: helpdesk
--

COPY public.companies (id, name, tax_id, is_active, created_at, logo_url, address, phone) FROM stdin;
1	Guzman Tech	\N	t	2026-05-12 22:49:25.37805+00	\N	\N	\N
\.


--
-- Data for Name: departments; Type: TABLE DATA; Schema: public; Owner: helpdesk
--

COPY public.departments (id, name, company_id) FROM stdin;
1	Soporte TI	1
2	Mantenimiento	1
3	Servicios Generales	1
\.


--
-- Data for Name: external_apps; Type: TABLE DATA; Schema: public; Owner: helpdesk
--

COPY public.external_apps (id, name, client_id, api_key_hash, prefix, is_active, company_id, created_at) FROM stdin;
1	ventasmart	APP-9A8B6545	69d142d15538abc5783536a872eed01cedb6333db15e2bf4a8f1c3d9692c5c90	vs	t	1	2026-05-13 21:35:30.53654
\.


--
-- Data for Name: inventory_movements; Type: TABLE DATA; Schema: public; Owner: helpdesk
--

COPY public.inventory_movements (id, code, product_id, ticket_id, user_id, quantity, reason, warehouse_id, type, created_at) FROM stdin;
\.


--
-- Data for Name: maintenances; Type: TABLE DATA; Schema: public; Owner: helpdesk
--

COPY public.maintenances (id, product_id, tecnico_id, ticket_id, type, priority, description, scheduled_date, completed_at, status, created_at) FROM stdin;
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: helpdesk
--

COPY public.notifications (id, user_id, title, message, type, url, is_read, email_sent, created_at) FROM stdin;
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: helpdesk
--

COPY public.products (id, code, name, description, price, stock, created_at, barcode, type, stock_minimo, cost, company_id, category_id, provider_id, serial_number, purchase_date, warranty_template_id, specs, updated_at) FROM stdin;
\.


--
-- Data for Name: providers; Type: TABLE DATA; Schema: public; Owner: helpdesk
--

COPY public.providers (id, name, tax_id, contact_name, email, phone, company_id) FROM stdin;
\.


--
-- Data for Name: purchase_order_items; Type: TABLE DATA; Schema: public; Owner: helpdesk
--

COPY public.purchase_order_items (id, order_id, product_id, quantity, cost) FROM stdin;
\.


--
-- Data for Name: purchase_orders; Type: TABLE DATA; Schema: public; Owner: helpdesk
--

COPY public.purchase_orders (id, code, provider_id, total, status, company_id, created_at) FROM stdin;
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: helpdesk
--

COPY public.roles (id, name, description, permissions, is_system, company_id, created_at) FROM stdin;
1	Admin	\N	{"all": ["all"], "tickets": ["ver", "crear", "editar", "asignar", "comentar"], "reportes": ["ver", "exportar_pdf", "exportar_excel"], "usuarios": ["ver", "crear", "editar"], "dashboard": ["ver", "metricas_globales"], "inventario": ["ver", "crear", "editar", "ajustar_stock"], "configuracion": ["ver", "editar_empresa", "api_keys"]}	t	\N	2026-05-13 01:56:35.558109+00
3	User	\N	{"tickets": ["crear", "ver", "editar", "comentar"], "inventario": ["ver"]}	t	\N	2026-05-13 01:56:35.558109+00
2	Technician	\N	{"tickets": ["ver", "editar", "responder", "crear", "asignar", "comentar"], "reportes": ["ver", "exportar_pdf", "exportar_excel"], "usuarios": ["ver", "crear", "editar"], "inventario": ["ver", "editar", "ajustar_stock"], "configuracion": ["ver"]}	t	\N	2026-05-13 01:56:35.558109+00
4	test		{"tickets": ["ver"], "reportes": ["ver"], "usuarios": ["ver"], "dashboard": ["ver"], "inventario": ["ver"], "configuracion": ["ver"]}	f	1	2026-05-13 20:29:25.502101+00
5	SuperAdmin	\N	{}	t	\N	2026-05-13 21:22:19.974595+00
6	SuperAdmin	\N	{}	t	\N	2026-05-13 21:23:46.014919+00
\.


--
-- Data for Name: sequences; Type: TABLE DATA; Schema: public; Owner: helpdesk
--

COPY public.sequences (entity, last_number) FROM stdin;
\.


--
-- Data for Name: support_rounds; Type: TABLE DATA; Schema: public; Owner: helpdesk
--

COPY public.support_rounds (id, company_id, area, responsible_name, technician_name, has_incident, incident_description, action_taken, visit_time, created_at) FROM stdin;
1	1	enfermeria	felicia perez	Alberto Guzman	f	\N	\N	2026-05-13 13:33:00	2026-05-14 01:35:19.07762+00
\.


--
-- Data for Name: tickets; Type: TABLE DATA; Schema: public; Owner: helpdesk
--

COPY public.tickets (id, code, title, description, status, priority, company_id, created_at, updated_at, department_id, category_id, requester_id, requester_name, requester_dept, technician_id, asset_id, photo_before, photo_after, closing_signature, lat, lng, maps_url, external_source) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: helpdesk
--

COPY public.users (id, email, hashed_password, full_name, role, is_active, company_id, created_at, department_id, signature_url, user_code, role_id, role_name, username) FROM stdin;
4	aguzman0522@gmail.com	$pbkdf2-sha256$29000$5TxHaO3d.z/nHMM4hzDG2A$FLlIJbCLcLR0XvCl6dtmuhbrr3t86p7/.e3xS0ryFTA	Alberto Guzman	\N	t	1	2026-05-13 21:23:46.014919+00	\N	\N	USR-0001	5	admin	aguzman
\.


--
-- Data for Name: warehouses; Type: TABLE DATA; Schema: public; Owner: helpdesk
--

COPY public.warehouses (id, name, location, company_id) FROM stdin;
\.


--
-- Data for Name: warranty_templates; Type: TABLE DATA; Schema: public; Owner: helpdesk
--

COPY public.warranty_templates (id, company_id, name, months, terms, return_policy, created_at) FROM stdin;
\.


--
-- Data for Name: webhook_logs; Type: TABLE DATA; Schema: public; Owner: helpdesk
--

COPY public.webhook_logs (id, external_app_id, event, url, payload, response_status, response_body, retry_count, created_at) FROM stdin;
\.


--
-- Name: api_keys_id_seq; Type: SEQUENCE SET; Schema: public; Owner: helpdesk
--

SELECT pg_catalog.setval('public.api_keys_id_seq', 1, false);


--
-- Name: assignments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: helpdesk
--

SELECT pg_catalog.setval('public.assignments_id_seq', 1, false);


--
-- Name: audit_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: helpdesk
--

SELECT pg_catalog.setval('public.audit_logs_id_seq', 1, false);


--
-- Name: calendar_events_id_seq; Type: SEQUENCE SET; Schema: public; Owner: helpdesk
--

SELECT pg_catalog.setval('public.calendar_events_id_seq', 1, false);


--
-- Name: categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: helpdesk
--

SELECT pg_catalog.setval('public.categories_id_seq', 6, true);


--
-- Name: chat_messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: helpdesk
--

SELECT pg_catalog.setval('public.chat_messages_id_seq', 1, false);


--
-- Name: companies_id_seq; Type: SEQUENCE SET; Schema: public; Owner: helpdesk
--

SELECT pg_catalog.setval('public.companies_id_seq', 3, true);


--
-- Name: departments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: helpdesk
--

SELECT pg_catalog.setval('public.departments_id_seq', 3, true);


--
-- Name: external_apps_id_seq; Type: SEQUENCE SET; Schema: public; Owner: helpdesk
--

SELECT pg_catalog.setval('public.external_apps_id_seq', 1, true);


--
-- Name: inventory_movements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: helpdesk
--

SELECT pg_catalog.setval('public.inventory_movements_id_seq', 1, false);


--
-- Name: maintenances_id_seq; Type: SEQUENCE SET; Schema: public; Owner: helpdesk
--

SELECT pg_catalog.setval('public.maintenances_id_seq', 1, false);


--
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: helpdesk
--

SELECT pg_catalog.setval('public.notifications_id_seq', 1, false);


--
-- Name: products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: helpdesk
--

SELECT pg_catalog.setval('public.products_id_seq', 1, false);


--
-- Name: providers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: helpdesk
--

SELECT pg_catalog.setval('public.providers_id_seq', 1, false);


--
-- Name: purchase_order_items_id_seq; Type: SEQUENCE SET; Schema: public; Owner: helpdesk
--

SELECT pg_catalog.setval('public.purchase_order_items_id_seq', 1, false);


--
-- Name: purchase_orders_id_seq; Type: SEQUENCE SET; Schema: public; Owner: helpdesk
--

SELECT pg_catalog.setval('public.purchase_orders_id_seq', 1, false);


--
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: helpdesk
--

SELECT pg_catalog.setval('public.roles_id_seq', 6, true);


--
-- Name: support_rounds_id_seq; Type: SEQUENCE SET; Schema: public; Owner: helpdesk
--

SELECT pg_catalog.setval('public.support_rounds_id_seq', 1, true);


--
-- Name: tickets_id_seq; Type: SEQUENCE SET; Schema: public; Owner: helpdesk
--

SELECT pg_catalog.setval('public.tickets_id_seq', 1, false);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: helpdesk
--

SELECT pg_catalog.setval('public.users_id_seq', 4, true);


--
-- Name: warehouses_id_seq; Type: SEQUENCE SET; Schema: public; Owner: helpdesk
--

SELECT pg_catalog.setval('public.warehouses_id_seq', 1, false);


--
-- Name: warranty_templates_id_seq; Type: SEQUENCE SET; Schema: public; Owner: helpdesk
--

SELECT pg_catalog.setval('public.warranty_templates_id_seq', 1, false);


--
-- Name: webhook_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: helpdesk
--

SELECT pg_catalog.setval('public.webhook_logs_id_seq', 1, false);


--
-- Name: alembic_version alembic_version_pkc; Type: CONSTRAINT; Schema: public; Owner: helpdesk
--

ALTER TABLE ONLY public.alembic_version
    ADD CONSTRAINT alembic_version_pkc PRIMARY KEY (version_num);


--
-- Name: api_keys api_keys_client_id_key; Type: CONSTRAINT; Schema: public; Owner: helpdesk
--

ALTER TABLE ONLY public.api_keys
    ADD CONSTRAINT api_keys_client_id_key UNIQUE (client_id);


--
-- Name: api_keys api_keys_pkey; Type: CONSTRAINT; Schema: public; Owner: helpdesk
--

ALTER TABLE ONLY public.api_keys
    ADD CONSTRAINT api_keys_pkey PRIMARY KEY (id);


--
-- Name: assignments assignments_act_code_key; Type: CONSTRAINT; Schema: public; Owner: helpdesk
--

ALTER TABLE ONLY public.assignments
    ADD CONSTRAINT assignments_act_code_key UNIQUE (act_code);


--
-- Name: assignments assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: helpdesk
--

ALTER TABLE ONLY public.assignments
    ADD CONSTRAINT assignments_pkey PRIMARY KEY (id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: helpdesk
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: calendar_events calendar_events_pkey; Type: CONSTRAINT; Schema: public; Owner: helpdesk
--

ALTER TABLE ONLY public.calendar_events
    ADD CONSTRAINT calendar_events_pkey PRIMARY KEY (id);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: helpdesk
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: chat_messages chat_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: helpdesk
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT chat_messages_pkey PRIMARY KEY (id);


--
-- Name: companies companies_pkey; Type: CONSTRAINT; Schema: public; Owner: helpdesk
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_pkey PRIMARY KEY (id);


--
-- Name: companies companies_tax_id_key; Type: CONSTRAINT; Schema: public; Owner: helpdesk
--

ALTER TABLE ONLY public.companies
    ADD CONSTRAINT companies_tax_id_key UNIQUE (tax_id);


--
-- Name: departments departments_pkey; Type: CONSTRAINT; Schema: public; Owner: helpdesk
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_pkey PRIMARY KEY (id);


--
-- Name: external_apps external_apps_pkey; Type: CONSTRAINT; Schema: public; Owner: helpdesk
--

ALTER TABLE ONLY public.external_apps
    ADD CONSTRAINT external_apps_pkey PRIMARY KEY (id);


--
-- Name: inventory_movements inventory_movements_code_key; Type: CONSTRAINT; Schema: public; Owner: helpdesk
--

ALTER TABLE ONLY public.inventory_movements
    ADD CONSTRAINT inventory_movements_code_key UNIQUE (code);


--
-- Name: inventory_movements inventory_movements_pkey; Type: CONSTRAINT; Schema: public; Owner: helpdesk
--

ALTER TABLE ONLY public.inventory_movements
    ADD CONSTRAINT inventory_movements_pkey PRIMARY KEY (id);


--
-- Name: maintenances maintenances_pkey; Type: CONSTRAINT; Schema: public; Owner: helpdesk
--

ALTER TABLE ONLY public.maintenances
    ADD CONSTRAINT maintenances_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: helpdesk
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: helpdesk
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: providers providers_pkey; Type: CONSTRAINT; Schema: public; Owner: helpdesk
--

ALTER TABLE ONLY public.providers
    ADD CONSTRAINT providers_pkey PRIMARY KEY (id);


--
-- Name: purchase_order_items purchase_order_items_pkey; Type: CONSTRAINT; Schema: public; Owner: helpdesk
--

ALTER TABLE ONLY public.purchase_order_items
    ADD CONSTRAINT purchase_order_items_pkey PRIMARY KEY (id);


--
-- Name: purchase_orders purchase_orders_code_key; Type: CONSTRAINT; Schema: public; Owner: helpdesk
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_code_key UNIQUE (code);


--
-- Name: purchase_orders purchase_orders_pkey; Type: CONSTRAINT; Schema: public; Owner: helpdesk
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_pkey PRIMARY KEY (id);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: public; Owner: helpdesk
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: sequences sequences_pkey; Type: CONSTRAINT; Schema: public; Owner: helpdesk
--

ALTER TABLE ONLY public.sequences
    ADD CONSTRAINT sequences_pkey PRIMARY KEY (entity);


--
-- Name: support_rounds support_rounds_pkey; Type: CONSTRAINT; Schema: public; Owner: helpdesk
--

ALTER TABLE ONLY public.support_rounds
    ADD CONSTRAINT support_rounds_pkey PRIMARY KEY (id);


--
-- Name: tickets tickets_pkey; Type: CONSTRAINT; Schema: public; Owner: helpdesk
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: helpdesk
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: helpdesk
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: warehouses warehouses_pkey; Type: CONSTRAINT; Schema: public; Owner: helpdesk
--

ALTER TABLE ONLY public.warehouses
    ADD CONSTRAINT warehouses_pkey PRIMARY KEY (id);


--
-- Name: warranty_templates warranty_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: helpdesk
--

ALTER TABLE ONLY public.warranty_templates
    ADD CONSTRAINT warranty_templates_pkey PRIMARY KEY (id);


--
-- Name: webhook_logs webhook_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: helpdesk
--

ALTER TABLE ONLY public.webhook_logs
    ADD CONSTRAINT webhook_logs_pkey PRIMARY KEY (id);


--
-- Name: ix_assignments_id; Type: INDEX; Schema: public; Owner: helpdesk
--

CREATE INDEX ix_assignments_id ON public.assignments USING btree (id);


--
-- Name: ix_audit_logs_id; Type: INDEX; Schema: public; Owner: helpdesk
--

CREATE INDEX ix_audit_logs_id ON public.audit_logs USING btree (id);


--
-- Name: ix_calendar_events_id; Type: INDEX; Schema: public; Owner: helpdesk
--

CREATE INDEX ix_calendar_events_id ON public.calendar_events USING btree (id);


--
-- Name: ix_categories_id; Type: INDEX; Schema: public; Owner: helpdesk
--

CREATE INDEX ix_categories_id ON public.categories USING btree (id);


--
-- Name: ix_chat_messages_id; Type: INDEX; Schema: public; Owner: helpdesk
--

CREATE INDEX ix_chat_messages_id ON public.chat_messages USING btree (id);


--
-- Name: ix_companies_id; Type: INDEX; Schema: public; Owner: helpdesk
--

CREATE INDEX ix_companies_id ON public.companies USING btree (id);


--
-- Name: ix_companies_name; Type: INDEX; Schema: public; Owner: helpdesk
--

CREATE UNIQUE INDEX ix_companies_name ON public.companies USING btree (name);


--
-- Name: ix_departments_id; Type: INDEX; Schema: public; Owner: helpdesk
--

CREATE INDEX ix_departments_id ON public.departments USING btree (id);


--
-- Name: ix_external_apps_client_id; Type: INDEX; Schema: public; Owner: helpdesk
--

CREATE UNIQUE INDEX ix_external_apps_client_id ON public.external_apps USING btree (client_id);


--
-- Name: ix_external_apps_id; Type: INDEX; Schema: public; Owner: helpdesk
--

CREATE INDEX ix_external_apps_id ON public.external_apps USING btree (id);


--
-- Name: ix_inventory_movements_id; Type: INDEX; Schema: public; Owner: helpdesk
--

CREATE INDEX ix_inventory_movements_id ON public.inventory_movements USING btree (id);


--
-- Name: ix_maintenances_id; Type: INDEX; Schema: public; Owner: helpdesk
--

CREATE INDEX ix_maintenances_id ON public.maintenances USING btree (id);


--
-- Name: ix_notifications_id; Type: INDEX; Schema: public; Owner: helpdesk
--

CREATE INDEX ix_notifications_id ON public.notifications USING btree (id);


--
-- Name: ix_notifications_user_id; Type: INDEX; Schema: public; Owner: helpdesk
--

CREATE INDEX ix_notifications_user_id ON public.notifications USING btree (user_id);


--
-- Name: ix_products_barcode; Type: INDEX; Schema: public; Owner: helpdesk
--

CREATE UNIQUE INDEX ix_products_barcode ON public.products USING btree (barcode);


--
-- Name: ix_products_code; Type: INDEX; Schema: public; Owner: helpdesk
--

CREATE UNIQUE INDEX ix_products_code ON public.products USING btree (code);


--
-- Name: ix_products_id; Type: INDEX; Schema: public; Owner: helpdesk
--

CREATE INDEX ix_products_id ON public.products USING btree (id);


--
-- Name: ix_providers_id; Type: INDEX; Schema: public; Owner: helpdesk
--

CREATE INDEX ix_providers_id ON public.providers USING btree (id);


--
-- Name: ix_purchase_order_items_id; Type: INDEX; Schema: public; Owner: helpdesk
--

CREATE INDEX ix_purchase_order_items_id ON public.purchase_order_items USING btree (id);


--
-- Name: ix_purchase_orders_id; Type: INDEX; Schema: public; Owner: helpdesk
--

CREATE INDEX ix_purchase_orders_id ON public.purchase_orders USING btree (id);


--
-- Name: ix_tickets_code; Type: INDEX; Schema: public; Owner: helpdesk
--

CREATE UNIQUE INDEX ix_tickets_code ON public.tickets USING btree (code);


--
-- Name: ix_tickets_id; Type: INDEX; Schema: public; Owner: helpdesk
--

CREATE INDEX ix_tickets_id ON public.tickets USING btree (id);


--
-- Name: ix_users_email; Type: INDEX; Schema: public; Owner: helpdesk
--

CREATE UNIQUE INDEX ix_users_email ON public.users USING btree (email);


--
-- Name: ix_users_id; Type: INDEX; Schema: public; Owner: helpdesk
--

CREATE INDEX ix_users_id ON public.users USING btree (id);


--
-- Name: ix_warehouses_id; Type: INDEX; Schema: public; Owner: helpdesk
--

CREATE INDEX ix_warehouses_id ON public.warehouses USING btree (id);


--
-- Name: ix_warranty_templates_id; Type: INDEX; Schema: public; Owner: helpdesk
--

CREATE INDEX ix_warranty_templates_id ON public.warranty_templates USING btree (id);


--
-- Name: ix_webhook_logs_id; Type: INDEX; Schema: public; Owner: helpdesk
--

CREATE INDEX ix_webhook_logs_id ON public.webhook_logs USING btree (id);


--
-- Name: api_keys api_keys_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: helpdesk
--

ALTER TABLE ONLY public.api_keys
    ADD CONSTRAINT api_keys_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: assignments assignments_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: helpdesk
--

ALTER TABLE ONLY public.assignments
    ADD CONSTRAINT assignments_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: assignments assignments_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: helpdesk
--

ALTER TABLE ONLY public.assignments
    ADD CONSTRAINT assignments_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: assignments assignments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: helpdesk
--

ALTER TABLE ONLY public.assignments
    ADD CONSTRAINT assignments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: audit_logs audit_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: helpdesk
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: calendar_events calendar_events_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: helpdesk
--

ALTER TABLE ONLY public.calendar_events
    ADD CONSTRAINT calendar_events_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: calendar_events calendar_events_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: helpdesk
--

ALTER TABLE ONLY public.calendar_events
    ADD CONSTRAINT calendar_events_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id);


--
-- Name: calendar_events calendar_events_maintenance_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: helpdesk
--

ALTER TABLE ONLY public.calendar_events
    ADD CONSTRAINT calendar_events_maintenance_id_fkey FOREIGN KEY (maintenance_id) REFERENCES public.maintenances(id);


--
-- Name: calendar_events calendar_events_ticket_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: helpdesk
--

ALTER TABLE ONLY public.calendar_events
    ADD CONSTRAINT calendar_events_ticket_id_fkey FOREIGN KEY (ticket_id) REFERENCES public.tickets(id);


--
-- Name: calendar_events calendar_events_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: helpdesk
--

ALTER TABLE ONLY public.calendar_events
    ADD CONSTRAINT calendar_events_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: categories categories_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: helpdesk
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: categories categories_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: helpdesk
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id);


--
-- Name: chat_messages chat_messages_ticket_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: helpdesk
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT chat_messages_ticket_id_fkey FOREIGN KEY (ticket_id) REFERENCES public.tickets(id);


--
-- Name: chat_messages chat_messages_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: helpdesk
--

ALTER TABLE ONLY public.chat_messages
    ADD CONSTRAINT chat_messages_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: departments departments_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: helpdesk
--

ALTER TABLE ONLY public.departments
    ADD CONSTRAINT departments_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: external_apps external_apps_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: helpdesk
--

ALTER TABLE ONLY public.external_apps
    ADD CONSTRAINT external_apps_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: inventory_movements inventory_movements_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: helpdesk
--

ALTER TABLE ONLY public.inventory_movements
    ADD CONSTRAINT inventory_movements_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: inventory_movements inventory_movements_ticket_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: helpdesk
--

ALTER TABLE ONLY public.inventory_movements
    ADD CONSTRAINT inventory_movements_ticket_id_fkey FOREIGN KEY (ticket_id) REFERENCES public.tickets(id);


--
-- Name: inventory_movements inventory_movements_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: helpdesk
--

ALTER TABLE ONLY public.inventory_movements
    ADD CONSTRAINT inventory_movements_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: inventory_movements inventory_movements_warehouse_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: helpdesk
--

ALTER TABLE ONLY public.inventory_movements
    ADD CONSTRAINT inventory_movements_warehouse_id_fkey FOREIGN KEY (warehouse_id) REFERENCES public.warehouses(id);


--
-- Name: maintenances maintenances_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: helpdesk
--

ALTER TABLE ONLY public.maintenances
    ADD CONSTRAINT maintenances_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: maintenances maintenances_tecnico_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: helpdesk
--

ALTER TABLE ONLY public.maintenances
    ADD CONSTRAINT maintenances_tecnico_id_fkey FOREIGN KEY (tecnico_id) REFERENCES public.users(id);


--
-- Name: maintenances maintenances_ticket_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: helpdesk
--

ALTER TABLE ONLY public.maintenances
    ADD CONSTRAINT maintenances_ticket_id_fkey FOREIGN KEY (ticket_id) REFERENCES public.tickets(id);


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: helpdesk
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: products products_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: helpdesk
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id);


--
-- Name: products products_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: helpdesk
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: products products_provider_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: helpdesk
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_provider_id_fkey FOREIGN KEY (provider_id) REFERENCES public.providers(id);


--
-- Name: providers providers_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: helpdesk
--

ALTER TABLE ONLY public.providers
    ADD CONSTRAINT providers_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: purchase_order_items purchase_order_items_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: helpdesk
--

ALTER TABLE ONLY public.purchase_order_items
    ADD CONSTRAINT purchase_order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.purchase_orders(id);


--
-- Name: purchase_order_items purchase_order_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: helpdesk
--

ALTER TABLE ONLY public.purchase_order_items
    ADD CONSTRAINT purchase_order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: purchase_orders purchase_orders_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: helpdesk
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: purchase_orders purchase_orders_provider_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: helpdesk
--

ALTER TABLE ONLY public.purchase_orders
    ADD CONSTRAINT purchase_orders_provider_id_fkey FOREIGN KEY (provider_id) REFERENCES public.providers(id);


--
-- Name: support_rounds support_rounds_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: helpdesk
--

ALTER TABLE ONLY public.support_rounds
    ADD CONSTRAINT support_rounds_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: tickets tickets_asset_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: helpdesk
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_asset_id_fkey FOREIGN KEY (asset_id) REFERENCES public.products(id);


--
-- Name: tickets tickets_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: helpdesk
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id);


--
-- Name: tickets tickets_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: helpdesk
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: tickets tickets_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: helpdesk
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id);


--
-- Name: tickets tickets_requester_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: helpdesk
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_requester_id_fkey FOREIGN KEY (requester_id) REFERENCES public.users(id);


--
-- Name: tickets tickets_technician_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: helpdesk
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_technician_id_fkey FOREIGN KEY (technician_id) REFERENCES public.users(id);


--
-- Name: users users_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: helpdesk
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: users users_department_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: helpdesk
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id);


--
-- Name: warehouses warehouses_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: helpdesk
--

ALTER TABLE ONLY public.warehouses
    ADD CONSTRAINT warehouses_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: warranty_templates warranty_templates_company_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: helpdesk
--

ALTER TABLE ONLY public.warranty_templates
    ADD CONSTRAINT warranty_templates_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id);


--
-- Name: webhook_logs webhook_logs_external_app_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: helpdesk
--

ALTER TABLE ONLY public.webhook_logs
    ADD CONSTRAINT webhook_logs_external_app_id_fkey FOREIGN KEY (external_app_id) REFERENCES public.external_apps(id);


--
-- PostgreSQL database dump complete
--

\unrestrict UafFi21SCG9jrQWSYx83fCq2gL2nO3JxEAuxwV5fVj58Oa69efseJ4kGJUKButt

